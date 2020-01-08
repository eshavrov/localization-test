export default function welcome(message) {
  if (isEnvDevelopment) {
    console.log("I am Develop mode");
  }

  console.log(`Hello ${message}`);
}
