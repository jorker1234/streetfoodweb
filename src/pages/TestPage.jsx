import React, { useEffect } from "react";
import { Link } from "react-router-dom";
const TestPage = () => {
  useEffect(() => {
    console.log("init");
  }, []);
  return (
    <React.Fragment>
      <Link to={"/menu"}>
        <div>Test</div>
      </Link>
    </React.Fragment>
  );
};

export default TestPage;
