import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams, Form } from "@remix-run/react";
import { Calendar, User } from "lucide-react";
import { prisma } from "~/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Jobify" },
    { name: "description", content: "Welcome to Jobify!" },
  ];
};
export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const filter = url.searchParams.get("filter") || "all";

  const whereClause: any = {};
  if (filter === "today") {
    whereClause.createdAt = {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
    };
  } else if (filter === "recent-jobs") {
    whereClause.createdAt = {
      gte: new Date(new Date().setDate(new Date().getDate() - 7)),
    };
  } else if (filter === "recent-male-job") {
    whereClause.studentGender = "Male";
  } else if (filter === "recent-female-job") {
    whereClause.studentGender = "Female";
  }

  const jobs = await prisma.job.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  return json({ jobs, search, filter });
};

export default function Index() {
  const { jobs, filter } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <div className="min-w-80">
      <nav className="bg-green-500 py-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between">
          <h1 className="text-2xl text-white uppercase mb-4 lg:mb-0">
            Jobify Jobs
          </h1>

          <div className="flex items-center gap-4">
            <Form
              method="get"
              className="flex mx-4 lg:mx-0 flex-col items-center lg:flex-row gap-4"
            >
              <select
                name="filter"
                className="px-3 py-2 rounded appearance-none w-full"
                defaultValue={filter}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  newParams.set("filter", e.target.value);
                  window.location.search = newParams.toString();
                }}
              >
                <option value="all">All</option>
                <option value="today">Today</option>
                <option value="recent-jobs">Recent Jobs</option>
                <option value="recent-male-job">Recent Male Jobs</option>
                <option value="recent-female-job">Recent Female Jobs</option>
              </select>
            </Form>
            <div>
              <Link to="/auth/signin">
                <button>
                  <User className="text-white" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto py-4 px-4 xl:px-0">
        {jobs.length === 0 ? (
          <p className="text-center text-green-600 my-20">No jobs found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map((job: any) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const JobCard = ({ job }: { job: any }) => {
  return (
    <div
      className="bg-white rounded-lg shadow border p-4 cursor-pointer
     hover:shadow hover:border-green-500 transition-all duration-300"
    >
      <div className="flex flex-wrap gap-4 justify-between items-center border-b pb-4 mb-4">
        <h2 className="text-lg font-semibold line-clamp-1 capitalize">
          <span className="bg-green-500 text-white px-2 py-1 rounded me-2">
            ID{job.id}
          </span>
          <span className="capitalize"> {job.title}</span>
        </h2>
        <div className="bg-green-100 px-2 py-1 text-nowrap text-sm border text-green-600 rounded">
          <Calendar className="inline -mt-1" size={16} />{" "}
          {new Date(job.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="flex gap-2 border-b pb-4 mb-4 font-medium">
        Location :
        <p className="text-green-500 capitalize font-normal">
          {job.location || "N/A"}
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
        <div>
          <p className="text-gray-900 font-medium">Subjects</p>
          <p className="text-green-500 capitalize">{job.subjects || "N/A"}</p>
        </div>
        <div>
          <p className="text-gray-900 font-medium">Student Gender</p>
          <p className="text-green-500">{job.studentGender || "N/A"}</p>
        </div>
        <div>
          <p className="text-gray-900 font-medium">Salary</p>
          <p className="text-green-500">
            {job.salary ? `${job.salary} BDT` : "N/A"}
          </p>
        </div>
        <div>
          <p className="text-gray-900 font-medium">Tutoring Time</p>
          <p className="text-green-500"> {job.tutoringTime || "N/A"}</p>
        </div>
      </div>
    </div>
  );
};
