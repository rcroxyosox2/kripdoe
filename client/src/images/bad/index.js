import styled from 'styled-components';
import { BGImageStyle } from '../styles';
import beyonce from './beyonce.png';

export const BeyonceStyle = styled(BGImageStyle)`
  background-image: url(${beyonce});
  width: 60%;
  height: 37%;
`;

export const images = [{src: beyonce, alt: 'beyonce ugly af', className: 'beyonce'}];

export default [
  BeyonceStyle,
];
