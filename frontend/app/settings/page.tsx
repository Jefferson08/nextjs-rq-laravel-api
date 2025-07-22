export default async function Settings() {
  await new Promise((resolve) => setTimeout(resolve, 3000));

  return <h1>Settings...</h1>;
}
