import Swal from "sweetalert2";
import { FaThumbsDown, FaThumbsUp } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";

interface Props {
  postId: number;
}

interface Vote {
  id: number;
  post_id: number;
  user_id: string;
  vote: number;
}

const vote = async (voteValue: number, postId: number, userId: string) => {
  const { data: existingVote } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .maybeSingle();

  if (existingVote) {
    if (existingVote.vote === voteValue) {
      const { error } = await supabase
        .from("votes")
        .delete()
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("votes")
        .update({ vote: voteValue })
        .eq("id", existingVote.id);

      if (error) throw new Error(error.message);
    }
  } else {
    const { error } = await supabase
      .from("votes")
      .insert({ post_id: postId, user_id: userId, vote: voteValue });

    if (error) throw new Error(error.message);
  }
};

const fetchVotes = async (postId: number): Promise<Vote[]> => {
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId);

  if (error) throw new Error(error.message);
  return data as Vote[];
};

export const LikeButton = ({ postId }: Props) => {
  const { user, signInWithGoogle } = useAuth(); // Ambil user dan fungsi login
  const queryClient = useQueryClient();

  const {
    data: votes,
    isLoading,
    error,
  } = useQuery<Vote[], Error>({
    queryKey: ["votes", postId],
    queryFn: () => fetchVotes(postId),
    refetchInterval: 5000,
  });

  const { mutate } = useMutation({
    mutationFn: (voteValue: number) => {
      if (!user) throw new Error("Kamu harus login dulu nih");
      return vote(voteValue, postId, user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["votes", postId] });
    },
  });

  if (isLoading) {
    return <div>Loading votes...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  const likes = votes?.filter((v) => v.vote === 1).length || 0;
  const dislikes = votes?.filter((v) => v.vote === -1).length || 0;
  const userVote = votes?.find((v) => v.user_id === user?.id)?.vote;

  // Handle Click Vote
  const handleVote = (voteValue: number) => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Anda belum login",
        text: "Silakan login untuk memberikan like atau dislike.",
        confirmButtonText: "Sign In",
        confirmButtonColor: "#6D4C41",
        showCancelButton: true,
        cancelButtonText: "Batal",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          signInWithGoogle(); // Panggil login Google saat tombol "Sign In" ditekan
        }
      });
      return;
    }
    mutate(voteValue);
  };

  return (
    <div className="flex items-center space-x-4 my-4">
      <button
        onClick={() => handleVote(1)}
        className={`text-xl px-3 py-1 cursor-pointer rounded transition-colors duration-150 flex items-center gap-2 ${
          userVote === 1 ? "bg-green-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <FaThumbsUp className="text-[#6D4C41] text-xl" /> {likes}
      </button>
      <button
        onClick={() => handleVote(-1)}
        className={`text-xl px-3 py-1 cursor-pointer rounded transition-colors duration-150 flex items-center gap-2 ${
          userVote === -1 ? "bg-red-500 text-white" : "bg-gray-200 text-black"
        }`}
      >
        <FaThumbsDown className="text-[#6D4C41] text-xl" /> {dislikes}
      </button>
    </div>
  );
};