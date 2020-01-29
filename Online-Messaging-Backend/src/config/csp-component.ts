import csp from "helmet-csp";

const cspComponent = csp({
  directives: {
    defaultSrc: [`'self'`],
    imgSrc: [`'self'`]
  }
});
export = cspComponent;
