import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Dummy stats
  const stats = {
    projects: 12,
    posts: 28,
    teamMembers: 7,
    messages: 16,
    bookings: 5,
  };

  const recentProjects = [
    { id: 1, title: "Youth Digital Skills Program", status: "Ongoing" },
    { id: 2, title: "Community Library Initiative", status: "Completed" },
    { id: 3, title: "Girls in Tech Malawi", status: "Ongoing" },
  ];

  const recentPosts = [
    { id: 1, title: "Empowering Youth Through Technology" },
    { id: 2, title: "Pamoza Launches New Learning Center" },
    { id: 3, title: "Our Impact in 2025" },
  ];

  const recentMessages = [
    { id: 1, name: "James Banda", subject: "Partnership Inquiry" },
    { id: 2, name: "Sarah Phiri", subject: "Volunteer Opportunity" },
    { id: 3, name: "John Mwale", subject: "Project Collaboration" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          Welcome back, {session.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of the Pamoza platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader>
            <CardTitle>Total Projects</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.projects}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blog Posts</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.posts}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.teamMembers}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.messages}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings</CardTitle>
          </CardHeader>
          <CardContent className="text-3xl font-bold">
            {stats.bookings}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Projects */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentProjects.map((project) => (
              <div key={project.id} className="flex justify-between text-sm">
                <span>{project.title}</span>
                <span className="text-muted-foreground">{project.status}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPosts.map((post) => (
              <p key={post.id} className="text-sm">
                {post.title}
              </p>
            ))}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <p className="font-medium">{msg.name}</p>
                <p className="text-muted-foreground">{msg.subject}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
