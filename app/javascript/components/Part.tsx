import React from 'react';
import { Table, Col } from 'react-bootstrap';
import { PartInfo } from '@hourglass/types';
import Body from './Body';
import { HTML } from './questions/HTML';
import { FileViewer } from './FileViewer';

interface PartProps {
  part: PartInfo;
  qnum: number;
  pnum: number;
}

const Part: React.FC<PartProps> = (props) => {
  const { part, qnum, pnum } = props;
  const {
    name, reference, description, points, body,
  } = part;
  let title = `Part ${pnum + 1}`;
  if (name) title += `: ${name}`;
  const subtitle = `(${points} points)`;
  return (
    <div id={`question-${qnum}-part-${pnum}`} className="part">
      <h3>
        {title}
        <small className="float-right text-muted">
          {subtitle}
        </small>
      </h3>
      <div><HTML value={description} /></div>
      {reference && <FileViewer references={reference} />}
      <Table hover borderless>
        <tbody>
          {body.map((b, i) => (
            <tr key={i}>
              <td className="row w-100 no-gutters">
                <Col>
                  <Body body={b} qnum={qnum} pnum={pnum} bnum={i} />
                </Col>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default Part;
