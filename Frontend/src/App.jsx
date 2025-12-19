import SignUp from "./pages/LoginModule/SignUp";
import Login from "./pages/LoginModule/Login";
import { Route, Switch, Redirect } from "react-router-dom";

function App() {
  return (
    <>
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/signup" component={SignUp} />
        <Redirect from="/" to="/signup" />
      </Switch>
    </>
  );
}

export default App;
