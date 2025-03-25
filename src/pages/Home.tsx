import { PostList } from "../components/PostList";

export const Home = () => {
  return (
    <div className="pt-10">
      <h2 className="text-6xl font-bold mb-8 text-center bg-gradient-to-b from-[#6D4C41] to-[#AB886D] bg-clip-text text-transparent ">
        Recent Posts
      </h2>
      <div>
        <PostList />
      </div>
    </div>
  );
};
