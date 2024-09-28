import app  from "./app.ts";

const port = process.env.PORT || 3000; // Fallback to port 3000 if PORT is not set

// Start the server
app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
