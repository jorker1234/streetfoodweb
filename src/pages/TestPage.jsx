import React, { useEffect } from "react";
const TestPage = () => {
  useEffect(() => {
    console.log("init");
  }, []);
  return (
    <React.Fragment>
      <div>Test</div>
    </React.Fragment>
  );
};

export default TestPage;
