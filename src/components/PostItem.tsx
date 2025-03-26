import { Link } from "react-router";
import { Post } from "./PostList";
import { FaCommentDots, FaHeart } from "react-icons/fa6";

interface Props {
  post: Post;
}

export const PostItem = ({ post }: Props) => {
  return (
    <div className="relative group">
      <div className="absolute -inset-1 rounded-[20px] bg-gradient-to-r from-[#6D4C41] to-[#AB886D] blur-sm opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
      <Link to={`/post/${post.id}`} className="block relative z-10">
        <div className="w-80 min-h-[250px] bg-gradient-to-br from-[#fff] to-[#f7ebe1] border border-[rgb(84,90,106)] rounded-[20px] text-white flex flex-col p-5 overflow-hidden transition-transform duration-300 transform hover:scale-105 shadow-2xl">
          {/* Header: Avatar and Title */}
          <div className="flex items-center space-x-2 mb-3">
            {post.avatar_url ? (
              <img
                src={post.avatar_url}
                alt="User Avatar"
                className="w-[35px] h-[35px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[35px] h-[35px] rounded-full bg-gradient-to-tl from-[#8A2BE2] to-[#491F70]" />
            )}
            <div className="flex flex-col flex-1">
              <div className="text-[20px] leading-[22px] font-bold items-center text-[#3E2723]">
                {post.title}
              </div>
            </div>
          </div>

          {/* Image Banner */}
          <div className="mt-2">
            <img
              src={post.image_url}
              alt={post.title}
              className="w-full h-[180px] rounded-[20px] object-cover mx-auto"
            />
          </div>
          <div className="flex justify-around items-center mt-1">
            <span className="cursor-pointer h-8 w-[40px] px-1 flex items-center justify-center font-extrabold rounded-lg text-[#6D4C41] transition-transform transform hover:scale-110 hover:text-[#3E2723]">
              <FaHeart className="text-[#6D4C41]" /> <span className="ml-2">{post.like_count ?? 0}</span>
            </span>
            <span className="cursor-pointer h-8 w-[40px] px-1 flex items-center justify-center font-extrabold rounded-lg text-[#6D4C41] transition-transform transform hover:scale-110 hover:text-[#3E2723]">
              <FaCommentDots className="text-[#6D4C41]" /> <span className="ml-2">{post.comment_count ?? 0}</span>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};