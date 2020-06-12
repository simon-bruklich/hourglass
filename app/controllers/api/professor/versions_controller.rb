# frozen_string_literal: true

module Api
  module Professor
    class VersionsController < ProfessorController
      before_action :find_version, only: [:show, :update, :destroy]
      before_action :find_exam_and_course

      before_action :require_prof_reg

      before_action :no_completed_regs, only: [:destroy]

      def show
        render json: serialize_version(@version)
      end

      def index
        version_regs = @exam.registrations.group_by(&:exam_version)
        render json: {
          versions: @exam.exam_versions.map do |version|
            regs = version_regs[version] || []
            serialize_version_regs version, regs
          end,
          sections: @exam.course.sections.map do |section|
            {
              id: section.id,
              title: section.title,
              students: section.registered_students_for(@exam).map do |student|
                serialize_student student
              end
            }
          end
        }
      end

      def update
        version = params[:version].permit!.to_h
        updated = @version.update!(
          {
            name: version[:name],
            info: version[:info],
            files: version[:files]
          }
        )
        render json: {
          updated: true
        }
      rescue StandardError => e
        render json: {
          updated: false,
          reason: e.message
        }
      end

      def create
        n = @exam.exam_versions.length + 1
        @version = ExamVersion.create(
          exam: @exam,
          name: "#{@exam.name} Version #{n}",
          files: [],
          info: {
            policies: [],
            answers: [],
            contents: {
              questions: []
            }
          }
        )
        @version.save!
        render json: serialize_version(@version)
      end

      def destroy
        @version.destroy!
        render json: {}
      end

      def update_all
        body = params.permit(versions: {})
        body[:versions].each do |version_id, student_ids|
          student_ids.each do |id|
            student_reg = @exam.registrations.find_or_initialize_by(user_id: id)
            student_reg.exam_version_id = version_id
            student_reg.save!
          end
        end
        render json: {
          created: true
        }
      rescue StandardError => e
        render json: {
          created: false,
          reason: e.message
        }
      end

      private

      def no_completed_regs
        head :conflict if @version.any_finalized?
      end

      def serialize_student(user)
        {
          id: user.id,
          displayName: user.display_name,
          username: user.username
        }
      end

      def serialize_version_regs(version, regs)
        {
          id: version.id,
          name: version.name,
          students: regs.map(&:user).map do |s|
            serialize_student s
          end
        }
      end

      def serialize_version(version)
        {
          id: version.id,
          name: version.name,
          policies: version.policies,
          contents: {
            exam: {
              questions: version.contents['questions'],
              reference: version.contents['reference'] || [],
              instructions: version.contents['instructions'] || { type: 'HTML', value: '' },
              files: version.files
            },
            answers: {
              answers: version.answers
            }
          }
        }
      end
    end
  end
end

