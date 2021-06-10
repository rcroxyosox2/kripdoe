import React, { useEffect, useState } from 'react';
import moment from 'moment';
import { useHistory, useLocation } from 'react-router-dom';
import {
  getTopCoins,
  megaInitialLoad,
} from 'services';
import { paths } from 'Router';
import { filter, sortBy } from 'lodash';
import { useStore } from 'store';
import useNoises from 'hooks/useNoises';
import useRequest from 'hooks/useRequest';
import Button from 'theme/Button';
import tapHereImg from 'images/tapHere.png';
import PageAnimation from 'pages/PageAnimation';
import {
  getTotalChangeFromCoinsResponse,
} from 'brains/coins'

import firebase from '../../firebase';

import {
  getRandomBadImgStyle,
  getRandomGoodImgStyle,
} from 'images';
import * as styles from './styles';

const RandomGoodImgStyle = getRandomGoodImgStyle();
const RandomBadImgStyle = getRandomBadImgStyle();

const CTA = ({ total, isGood, changePage }) => {
  const { getPlayNoiseFromNum } = useNoises();
  const history = useHistory();

  const handleHomeClick = () => {
    const audioFile = getPlayNoiseFromNum(total);
    audioFile.play();
    changePage(() => {
      history.push(paths.overview)
    });
  }
  const styleType = isGood() ? 'good' : 'bad';

  return <Button onClick={handleHomeClick} styleType={styleType}>Todayz MarketZ</Button>
}

const HomeScreenNoMyShit = ({ pageAnimationState, isGood, total, changePage }) => {
  const RandomImageStyle = isGood ? RandomGoodImgStyle : RandomBadImgStyle;
  return (
    <styles.HomeScreenNoMyShitStyle className={pageAnimationState}>
      <styles.RandomImageContainerStyle>
        {RandomImageStyle && <RandomImageStyle className="randomImg" />}
      </styles.RandomImageContainerStyle>
      <styles.TapHereImageContainerStyle>
        <img src={tapHereImg} alt="tap here" className="tapHereImg" />
      </styles.TapHereImageContainerStyle>
      <CTA isGood={isGood} total={total} changePage={changePage} />
    </styles.HomeScreenNoMyShitStyle>
  );
}

const HomeScreenWithMyShit = () => {
  return (<div>Todo</div>)
}

const Home = () => {
  const store = useStore();
  const isGood = () => true; //getTotalChange(response) > 0;
  const total = 0; //getTotalChangeFromArr(response);
  const coins = store.coins;
  const myShit = [];

  console.log(getTotalChangeFromCoinsResponse(coins));

  if (store.coinsLoading) {
    return <div>loading..</div>
  }

  if (store.coinsError) {
    return <div>{store.coinsError}</div>;
  }

  return (
    <PageAnimation>
      {({pageAnimationState, changePage}) => (
        <styles.HomeStyle className={pageAnimationState}>
        {
          (myShit.length > 0)
            ? <HomeScreenWithMyShit pageAnimationState={pageAnimationState} changePage={changePage} />
            : <HomeScreenNoMyShit total={total} isGood={isGood} pageAnimationState={pageAnimationState} changePage={changePage} />
        }
        </styles.HomeStyle>
      )}
    </PageAnimation>
  );
}

export default Home;