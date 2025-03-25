import { useQuery } from "@tanstack/react-query";
import { Post } from "./PostList";
import { supabase } from "../supabase-client";
import { LikeButton } from "./LikeButton";
import { CommentSection } from "./CommentSection";


interface Props{
    postId:number
}


const fetchPostsById= async (id:number): Promise<Post> => {
    const {data,error}=await supabase
    .from("posts")
    .select("*")
    .eq("id",id)
    .single();
   

  if (error) throw new Error(error.message);

  return data as Post;
};

export const PostDetail = ({postId}:Props) =>
{
    const{data,error,isLoading}=useQuery<Post,Error>({
        queryKey: ["post",postId], 
        queryFn:()=> fetchPostsById(postId),
    });


    if(isLoading)<div>Loading Posts...</div>
    if(error){
        return <div>Error: {error.message}</div>
    }
    const content = data?.content || '';
    return (
      <div className="space-y-6">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-b from-[#6D4C41] to-[#FF8A65] bg-clip-text text-transparent">
        {data?.title}
      </h2>
      {data?.image_url && (
        <div className="flex justify-center mb-15">
          <img
            src={data.image_url}
            alt={data?.title}
            className="mt-4 rounded object-contain max-w-full w-full md:max-w-lg lg:max-w-xl"
          />
        </div>
      )}
      
      <p className="text-[#6D4C41] text-xl font-semibold" dangerouslySetInnerHTML={{ __html: content.replace(/\n/g, '<br />') }} />
      <p className="text-gray-500 text-sm">
        Posted on:  {data?.created_at}
      </p>
    
      <LikeButton postId={postId} />
      <CommentSection postId={postId} />
    </div>
    
    )
}