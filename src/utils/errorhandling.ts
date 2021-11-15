export const prettyError = (
  prefix: string,
  error: any,
  ...optionalParams: any[]
) => {
  if (error.response) {
    console.error(
      prefix,
      optionalParams,
      error.response.data,
      `Status: ${error.response.status}`
    );
  } else if (error.stack) {
    console.error(`${prefix}\n`, optionalParams, error.stack);
  } else if (error.message) {
    console.error(prefix, optionalParams, error.message);
  } else {
    console.error(prefix, optionalParams, error);
  }
};
