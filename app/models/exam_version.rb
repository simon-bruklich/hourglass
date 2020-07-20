# frozen_string_literal: true

require 'marks_processor'

# A single version of an exam.
class ExamVersion < ApplicationRecord
  belongs_to :exam

  has_many :registrations, dependent: :destroy
  has_many :version_announcements, dependent: :destroy

  has_many :users, through: :registrations
  has_many :anomalies, through: :registrations
  has_many :grading_locks, through: :registrations

  validates :exam, presence: true

  delegate :course, to: :exam
  delegate :professors, to: :exam
  delegate :proctors_and_professors, to: :exam

  EXAM_SAVE_SCHEMA = Rails.root.join('config/schemas/exam-save.json').to_s
  validates :info, presence: true, json: {
    schema: -> { EXAM_SAVE_SCHEMA },
    message: ->(errors) { errors },
  }

  FILES_SCHEMA = Rails.root.join('config/schemas/files.json').to_s
  validates :files, presence: true, allow_blank: true, json: {
    schema: -> { FILES_SCHEMA },
    message: ->(errors) { errors },
  }

  def visible_to?(user)
    everyone.exists? user.id
  end

  def everyone
    proctors_and_professors.or(students)
  end

  def students
    User.where(id: registrations.select(:user_id))
  end

  def policies
    info['policies']
  end

  def contents
    info['contents']
  end

  def answers
    info['answers']
  end

  def rubrics
    info['rubrics']
  end

  def questions
    contents['questions']
  end

  def reference
    contents['reference'] || []
  end

  def instructions
    contents['instructions'] || { type: 'HTML', value: '' }
  end

  def total_points
    questions.map{|q| q['parts'].map{|p| p['points']}.sum}.sum
  end

  def default_answers
    def_answers = answers.map do |ans_q|
      ans_q.map do |ans_p|
        ans_p.map { |_| { "NO_ANS": true } }
      end
    end
    def_answers = [[[]]] if def_answers.empty?
    {
      answers: def_answers,
      scratch: '',
    }
  end

  def self.new_empty(exam)
    n = exam.exam_versions.length + 1
    new(
      exam: exam,
      name: "#{exam.name} Version #{n}",
      files: [],
      info: { policies: [], answers: [], contents: { reference: [], questions: [] } },
    )
  end

  def any_started?
    registrations.started.exists?
  end

  def any_finalized?
    registrations.final.exists?
  end

  def finalize!
    registrations.each(&:finalize!)
  end

  def finalized?
    registrations.in_progress.empty?
  end

  def export_json
    JSON.pretty_generate({
      info: info,
      files: files,
    })
  end

  def export_all(dir)
    path = Pathname.new(dir)
    export_info_file(path)
    files_path = path.join('files')
    FileUtils.mkdir_p files_path
    export_files(files_path, files)
  end

  def export_info_file(path)
    File.write path.join('exam.yaml'), info.to_yaml
  end

  def export_files(path, files)
    files.each do |f|
      if f['filedir'] == 'dir'
        dpath = path.join(f['path'])
        FileUtils.mkdir_p dpath
        export_files dpath, f['nodes']
      elsif f['filedir'] == 'file'
        fpath = path.join(f['path'])
        contents = MarksProcessor.process_marks_reverse(f['contents'], f['marks'])
        File.write fpath, contents
      else
        raise 'Bad file'
      end
    end
  end

  def qp_pairs
    questions.each_with_index.map do |q, qnum|
      q['parts'].each_with_index.map do |_, pnum|
        [qnum, pnum]
      end
    end.flatten(1)
  end

  def self.itemrubrics_in_rubric(rubric)
    rubric.map do |r|
      if r.key? 'rubrics'
        ExamVersion.itemrubrics_in_rubric(r['rubrics'])
      else
        r
      end
    end
  end

  def all_itemrubrics
    rubrics.map do |qrubric|
      qrubric['parts'].map do |prubric|
        [
          ExamVersion.itemrubrics_in_rubric(prubric['part']),
          prubric['body'].map do |brubric|
            ExamVersion.itemrubrics_in_rubric(brubric['rubrics'])
          end,
        ]
      end
    end.flatten
  end

  # -> PartRubric
  def rubric_for_part(qnum, pnum)
    rubrics.dig(qnum, 'parts', pnum)
  end

  def part_tree
    questions.each_with_index.map do |q, qnum|
      q['parts'].each_with_index.map do |p, pnum|
        yield({
          question: q,
          part: p,
          qnum: qnum,
          pnum: pnum,
          rubric: rubric_for_part(qnum, pnum),
        })
      end
    end
  end

  def bottlenose_summary
    questions.map do |q|
      parts = q['parts']
      if parts.count == 1
        {
          'name' => q.dig('name', 'value'),
          'weight' => parts.first['points'],
        }
      else
        {
          'name' => q.dig('name', 'value'),
          'parts' => parts.map do |p|
            {
              'name' => p.dig('name', 'value'),
              'weight' => p['points'],
            }.compact
          end,
        }
      end.compact
    end
  end
end
