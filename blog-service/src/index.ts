import app from "./app";

// Ensure PORT is a number
const PORT: number = parseInt(process.env.PORT || "5002", 10);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
