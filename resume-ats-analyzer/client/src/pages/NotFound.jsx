import { Link } from "react-router-dom";

function NotFound() {
  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="text-center">

        <h1 className="text-7xl font-bold text-blue-600">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-slate-800">
          Page Not Found
        </h2>

        <p className="mt-2 text-slate-500">
          Sorry, the page you are looking for does not exist.
        </p>

        <Link
          to={token ? "/dashboard" : "/login"}
          className="mt-6 inline-block rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          {token ? "Go to Dashboard" : "Go to Login"}
        </Link>

      </div>
    </div>
  );
}

export default NotFound;