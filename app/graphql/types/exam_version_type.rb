# frozen_string_literal: true

module Types
  class QpPairType < Types::BaseObject
    field :qnum, Integer, null: false
    field :pnum, Integer, null: false
  end
  class ExamVersionType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id

    guard ->(obj, args, ctx) {
      ans = Guards::VISIBILITY.call(obj, args, ctx)
      unless ctx[:skip_eager_fields]
        all_qpbs = obj.object.db_questions.includes(parts: :body_items).map do |q|
          [ q, q.parts.map do |p| [p, p.body_items.to_a] end ]
        end.flatten
        all_qpbs.each do |qpb|
          resolved = HourglassSchema.resolve_type(qpb.class, qpb, ctx)
          Guards.cache(
            ctx[:access_cache], 
            [resolved.name, qpb.id, :visible, ctx[:current_user].id],
            ans,
          )
        end
        [obj.object.rubrics, obj.object.db_references, obj.object.rubric_presets, obj.object.preset_comments].flatten.each do |r|
          resolved = HourglassSchema.resolve_type(r.class, r, ctx)
          Guards.cache(
            ctx[:access_cache], 
            [resolved.name, r.id, :visible, ctx[:current_user].id],
            ans,
          )
        end
      end
      ans
    }

    ALL_STAFF_OR_PUBLISHED = lambda { |obj, args, ctx|
      return true if Guards::ALL_STAFF.call(obj, args, ctx)
      reg = ctx[:current_user].reg_for(obj.object.exam)
      return reg&.published
    }

    field :name, String, null: false do
      guard Guards::ALL_STAFF
    end

    field :policies, [Types::LockdownPolicyType], null: false

    field :students, [Types::UserType], null: false do
      guard Guards::PROFESSORS
    end
    def students
      AssociationLoader.for(ExamVersion, :users, merge: -> { order(display_name: :asc) }).load(object)
    end

    field :any_started, Boolean, null: false do
      guard Guards::PROFESSORS
    end
    def any_started
      object.any_started?
    end

    field :started_count, Integer, null: false do
      guard Guards::PROFESSORS
    end
    def started_count
      object.registrations.started.count
    end

    field :any_finalized, Boolean, null: false do
      guard Guards::PROFESSORS
    end
    def any_finalized
      object.any_finalized?
    end

    field :finalized_count, Integer, null: false do
      guard Guards::PROFESSORS
    end
    def finalized_count
      object.registrations.final.count
    end

    # field :questions, GraphQL::Types::JSON, null: false do
    #   guard Guards::ALL_STAFF
    # end
    # def questions
    #   object.db_questions.as_json(format: :graphql)
    # end

    field :db_questions, [Types::QuestionType], null: false do
      guard ALL_STAFF_OR_PUBLISHED
    end

    field :db_references, [Types::ReferenceType], null: false do
      guard ALL_STAFF_OR_PUBLISHED
    end
    def db_references
      AssociationLoader
        .for(ExamVersion, :db_references, merge: -> { where(question_id: nil, part_id: nil) })
        .load(object)
    end

    field :answers, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end
    def answers
      object.answers
    end

    field :instructions, Types::HtmlType, null: false do
      guard ALL_STAFF_OR_PUBLISHED
    end
    def instructions
      {
        type: 'HTML',
        value: object.instructions,
      }
    end

    field :files, GraphQL::Types::JSON, null: false do
      guard ALL_STAFF_OR_PUBLISHED
    end

    field :all_rubrics, [Types::RubricType], null: true do
      guard Guards::ALL_STAFF
    end
    def all_rubrics
      AssociationLoader
        .for(ExamVersion, :rubrics)
        .load(object)
    end

    field :rubrics, [Types::RubricType], null: true do
      guard Guards::ALL_STAFF
    end
    def rubrics
      AssociationLoader
        .for(ExamVersion, :rubrics, merge: -> { where(question_id: nil, part_id: nil, body_item_id: nil) })
        .load(object)
    end

    field :root_rubric, Types::RubricType, null: true do
      guard Guards::ALL_STAFF
    end

    field :raw_rubrics, GraphQL::Types::JSON, null: true do
      guard Guards::PROFESSORS
    end
    def raw_rubrics
      object.rubric_as_json(format: :graphql)
    end

    field :file_export_url, String, null: false do
      guard Guards::PROFESSORS
    end
    def file_export_url
      Rails.application.routes.url_helpers.export_file_api_professor_version_path(object)
    end

    field :archive_export_url, String, null: false do
      guard Guards::PROFESSORS
    end
    def archive_export_url
      Rails.application.routes.url_helpers.export_archive_api_professor_version_path(object)
    end

    field :version_announcements, Types::VersionAnnouncementType.connection_type, null: false

    field :grading_locks, Types::GradingLockType.connection_type, null: false do
      argument :grader_id, ID, required: false, loads: Types::UserType
      argument :completed_by_id, ID, required: false, loads: Types::UserType
      argument :grader_current_user, Boolean, required: false
      argument :completed_by_current_user, Boolean, required: false
    end
    def grading_locks(grader: nil, completed_by: nil, grader_current_user: nil, completed_by_current_user: nil)
      grader = context[:current_user] if grader_current_user
      completed_by = context[:current_user] if completed_by_current_user
      if grader && completed_by
        puts "Grader #{grader.display_name}, completed_by #{completed_by.display_name}"
        AssociationLoader.for(ExamVersion, :grading_locks, 
          merge: -> { where(grader: grader, completed_by: completed_by).order(updated_at: :desc) }).load(object)
      elsif grader
        puts "Grader #{grader.display_name}"
        AssociationLoader.for(ExamVersion, :grading_locks, 
          merge: -> { where(grader: grader).order(updated_at: :desc) }).load(object)
      elsif completed_by
        puts "Completed_by #{completed_by.display_name}"
        AssociationLoader.for(ExamVersion, :grading_locks, 
          merge: -> { where(completed_by: completed_by).order(updated_at: :desc) }).load(object)
      else
        AssociationLoader.for(ExamVersion, :grading_locks,
          merge: -> { order(updated_at: :desc) }).load(object)
      end
    end

    field :qp_pairs, [Types::QpPairType], null: false do
      guard Guards::ALL_STAFF
    end
    def qp_pairs
      object.qp_pairs.map do |qp|
        { qnum: qp[:question].index, pnum: qp[:part].index }
      end
    end

    field :completion_summary, GraphQL::Types::JSON, null: false do
      guard Guards::ALL_STAFF
    end
    def completion_summary
      gls_by_qnum = object.grading_locks.group_by(&:question_id)
      object.db_questions.includes(:parts).map do |q|
        gls_by_pnum = (gls_by_qnum[q.id] || []).group_by(&:part_id)
        q.parts.map do |p|
          { 
            notStarted: gls_by_pnum[p.id]&.count { |gl| gl.grader_id.nil? && gl.completed_by_id.nil? } || 0,
            inProgress: gls_by_pnum[p.id]&.count { |gl| gl.completed_by_id.nil? && !gl.grader_id.nil? } || 0,
            finished: gls_by_pnum[p.id]&.count { |gl| !gl.completed_by_id.nil? } || 0,
          } 
        end
      end
    end
  end
end
