module Types
  class BodyItemType < Types::BaseObject
    implements GraphQL::Types::Relay::Node
    global_id_field :id
    field :id, ID, null: false

    guard Guards::VISIBILITY

    field :info, GraphQL::Types::JSON, null: false
    field :index, Integer, null: false

    field :answer, GraphQL::Types::JSON, null: true do
      guard Guards::ALL_STAFF
    end
  end
end