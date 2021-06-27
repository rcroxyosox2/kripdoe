import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
// import Home from 'pages/Home';
// import Overview from 'pages/Overview';

export const paths = {
  home: '/',
  overview: '/overview',
  fourohfour: '*'
};


const Test = () => {
  return "coming soon...";
};


const Routes = () => {
  return (
    <Router>
      <Switch>
        <Route exact path={paths.home} component={Test} />
        {/* <Route path={paths.overview} component={() => <Overview />} /> */}
        {/* <Route path={paths.fourohfour} component={() => <div>Four oh four</div>} /> */}
      </Switch>
    </Router>
  );
}

export default Routes;