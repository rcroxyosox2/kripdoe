import ucantap from 'images/pointto/ucantap.png';
import typeacoin from 'images/pointto/typeacoin.png';
import scrollfor from 'images/pointto/scrollfor.png';
import arrow from 'images/pointto/arrow.png';
import arrow2 from 'images/pointto/arrow2.png';
import * as styles from './styles';


export const messageTypes = {
  UCANTAP: 'ucantap',
  TYPEACOIN: 'typeacoin',
  SCROLLFOR: 'scrollfor',
};

const messageTypeResourceMap = {
  [messageTypes.UCANTAP]: [ucantap, arrow],
  [messageTypes.TYPEACOIN]: [typeacoin, arrow2],
  [messageTypes.SCROLLFOR]: [scrollfor, arrow2],
};

const PointTo = ({type}) => {
  const [message, arrow] = messageTypeResourceMap[type] || [];

  if (!message || !arrow) {
    console.error('point to message not valid');
  }

  return (
    <styles.PointToStyle>
      <div>
        <img src={message} />
        <img src={arrow} />
      </div>
    </styles.PointToStyle>
  );
};

PointTo.messageTypes = messageTypes;

PointTo.defaultProps = {
  type: messageTypes.UCANTAP
};

export default PointTo;
