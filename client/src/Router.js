import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Home from 'pages/Home';
import Splash from 'pages/Splash';
import Search from 'pages/Search';
import Overview from 'pages/Overview';

export const paths = {
  home: '/',
  overview: '/overview',
  search: '/search',
  fourohfour: '*'
};


const Test = () => {
  return "coming soon...";
};


const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path={paths.home} component={Splash} />
        <Route exact path={paths.search} component={Search} />
        <Route path={paths.overview} component={() => <Overview />} />
        {/* <Route path={paths.fourohfour} component={() => <div>Four oh four</div>} /> */}
      </Switch>
    </Router>
  );
}

export default Routes;