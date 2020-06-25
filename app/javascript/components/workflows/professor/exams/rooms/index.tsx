import React, { useCallback, useMemo, useContext } from 'react';
import { Room, useResponse as indexRooms } from '@hourglass/common/api/professor/rooms/index';
import { updateAll, Body } from '@hourglass/common/api/professor/rooms/updateAllRooms';
import {
  useParams,
  useHistory,
  Switch,
  Route,
} from 'react-router-dom';
import { ExhaustiveSwitchError } from '@hourglass/common/helpers';
import {
  Button,
  Form,
  FormControl,
  Row,
  Col,
} from 'react-bootstrap';
import Icon from '@hourglass/workflows/student/exams/show/components/Icon';
import { FaTrash, FaPlus } from 'react-icons/fa';
import {
  reduxForm,
  FormSection,
  FieldArray,
  WrappedFieldProps,
  FieldArrayFieldsProps,
  WrappedFieldArrayProps,
  Field,
  InjectedFormProps,
} from 'redux-form';
import { Provider } from 'react-redux';
import store from '@hourglass/common/student-dnd/store';
import { AlertContext } from '@hourglass/common/alerts';
import TooltipButton from '@hourglass/workflows/student/exams/show/components/TooltipButton';
import { useTabRefresher, TabEditButton } from '@professor/exams/admin';

const EditExamRooms: React.FC = () => {
  const { examId } = useParams();
  const [refresher] = useTabRefresher('rooms');
  const response = indexRooms(examId, [refresher]);
  switch (response.type) {
    case 'ERROR':
      return <p className="text-danger">{response.status}</p>;
    case 'LOADING':
      return <p>Loading...</p>;
    case 'RESULT':
      return <Loaded rooms={response.response.rooms} />;
    default:
      throw new ExhaustiveSwitchError(response);
  }
};

export default EditExamRooms;

function createInitialValues(rooms: Room[]): FormValues {
  return {
    rooms: rooms.map(({
      name,
      id,
      students,
      proctors,
    }) => ({
      name,
      id,
      numRegs: students.length + proctors.length,
    })),
  };
}

const Loaded: React.FC<{
  rooms: Room[];
}> = (props) => {
  const {
    rooms,
  } = props;
  return (
    <Row>
      <Col>
        <Switch>
          <Route path="/exams/:examId/admin/rooms/edit">
            <Editable rooms={rooms} />
          </Route>
          <Route>
            <Readonly rooms={rooms} />
          </Route>
        </Switch>
      </Col>
    </Row>
  );
};

const Editable: React.FC<{
  rooms: Room[];
}> = (props) => {
  const {
    rooms,
  } = props;
  const initialValues = useMemo(() => createInitialValues(rooms), [rooms]);
  return (
    <Provider store={store}>
      <EditExamRoomsForm
        initialValues={initialValues}
      />
    </Provider>
  );
};

const Readonly: React.FC<{
  rooms: Room[];
}> = (props) => {
  const {
    rooms,
  } = props;
  return (
    <>
      <h2>
        Rooms
        <span className="float-right">
          <TabEditButton />
        </span>
      </h2>
      {rooms.map((r) => (
        <Form.Group key={r.id}>
          <FormControl
            size="lg"
            value={r.name}
            disabled
          />
        </Form.Group>
      ))}
    </>
  );
};


const EditRoomName: React.FC<WrappedFieldProps> = (props) => {
  const { input } = props;
  const {
    value,
    onChange,
  } = input;
  return (
    <FormControl
      size="lg"
      placeholder="Room name"
      value={value}
      onChange={onChange}
    />
  );
};

const renderRoom = (member: string, index: number, fields: FieldArrayFieldsProps<FormRoom>) => (
  <FormSection
    name={member}
    key={index}
  >
    <li className="list-unstyled">
      <Form.Group as={Row}>
        <Col className="d-flex">
          <Field name="name" component={EditRoomName} />
          <TooltipButton
            variant="danger"
            onClick={() => fields.remove(index)}
            disabled={fields.get(index).numRegs !== 0}
            disabledMessage="This room has registered users."
            size="lg"
            className="text-nowrap ml-2"
          >
            <Icon I={FaTrash} />
            <span className="ml-1">
              Delete
            </span>
          </TooltipButton>
        </Col>
      </Form.Group>
    </li>
  </FormSection>
);

const ShowRooms: React.FC<WrappedFieldArrayProps<FormRoom>> = (props) => {
  const {
    fields,
  } = props;
  const addRoom = useCallback(() => {
    fields.push({
      name: '',
      numRegs: 0,
    });
  }, [fields]);
  return (
    <>
      {fields.map(renderRoom)}
      <Form.Group className="text-center">
        <Button
          size="lg"
          variant="success"
          onClick={addRoom}
        >
          <Icon I={FaPlus} />
          <span className="ml-1">
            Add room
          </span>
        </Button>
      </Form.Group>
    </>
  );
};

function transformForSubmit(initValues: Partial<FormValues>, values: FormValues): Body {
  const { rooms } = values;
  const { rooms: initRooms } = initValues;
  const updatedRooms: {
    id: number;
    name: string;
  }[] = rooms.reduce((acc, room) => {
    if (room.id !== undefined) {
      return [
        ...acc,
        {
          id: room.id,
          name: room.name,
        },
      ];
    }
    return acc;
  }, []);
  const newRooms = rooms.filter((r) => !('id' in r));
  const deletedRooms = initRooms.filter((ir) => !rooms.find((r) => r.id === ir.id));
  return {
    updatedRooms,
    newRooms: newRooms.map((r) => r.name),
    deletedRooms: deletedRooms.map((r) => r.id),
  };
}

const ExamRoomsForm: React.FC<InjectedFormProps<FormValues>> = (props) => {
  const {
    pristine,
    reset,
    handleSubmit,
    initialValues,
  } = props;
  const { examId } = useParams();
  const { alert } = useContext(AlertContext);
  const history = useHistory();
  const cancel = useCallback(() => {
    history.goBack();
  }, [history]);
  return (
    <form
      onSubmit={handleSubmit((values) => {
        const body = transformForSubmit(initialValues, values);
        updateAll(examId, body).then((res) => {
          if (res.created === false) throw new Error(res.reason);
          history.push(`/exams/${examId}/admin/rooms`);
          alert({
            variant: 'success',
            message: 'Rooms saved successfully.',
          });
        }).catch((err) => {
          alert({
            autohide: true,
            variant: 'danger',
            title: 'Failed saving rooms.',
            message: err.message,
          });
        });
      })}
    >
      <h2>
        Edit Rooms
        <span className="float-right">
          <Button
            className={pristine ? 'd-none' : ''}
            variant="danger"
            onClick={reset}
          >
            Reset
          </Button>
          <Button
            className="ml-2"
            variant="secondary"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            className="ml-2"
            variant="primary"
            type="submit"
          >
            Save
          </Button>
        </span>
      </h2>
      <FieldArray name="rooms" component={ShowRooms} />
    </form>
  );
};

interface FormRoom {
  id?: number;
  name: string;
  numRegs: number;
}

interface FormValues {
  rooms: FormRoom[];
}

const EditExamRoomsForm = reduxForm({
  form: 'room-editor',
})(ExamRoomsForm);