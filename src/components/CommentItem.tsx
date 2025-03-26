import { useState } from "react";
import Swal from "sweetalert2";
import { Comment } from "./CommentSection";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../supabase-client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface Props {
  comment: Comment & {
    children?: Comment[];
  };
  postId: number;
}

const createReply = async (
  replyContent: string,
  postId: number,
  parentCommentId: number,
  userId?: string,
  author?: string
) => {
  if (!userId || !author) {
    throw new Error("You must be logged in to reply.");
  }

  const { error } = await supabase.from("comments").insert({
    post_id: postId,
    content: replyContent,
    parent_comment_id: parentCommentId,
    user_id: userId,
    author: author,
  });

  if (error) throw new Error(error.message);
};

export const CommentItem = ({ comment, postId }: Props) => {
  const [showReply, setShowReply] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>("");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const { user, signInWithGoogle } = useAuth();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: (replyContent: string) =>
      createReply(replyContent, postId, comment.id, user?.id, user?.email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setReplyText("");
      setShowReply(false);
    },
  });

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText) return;
    mutate(replyText);
  };

  const handleReplyClick = () => {
    if (!user) {
      Swal.fire({
        icon: "warning",
        title: "Anda belum login",
        text: "Silakan login untuk membalas komentar.",
        confirmButtonText: "Sign In",
        confirmButtonColor: "#6D4C41",
        showCancelButton: true,
        cancelButtonText: "Batal",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          signInWithGoogle();
        }
      });
      return;
    }
    setShowReply(true);
  };

  const handleCancelReply = () => {
    Swal.fire({
      icon: "question",
      title: "Batalkan balasan?",
      text: "Apakah Anda yakin ingin membatalkan balasan ini?",
      showCancelButton: true,
      confirmButtonText: "Ya, batalkan",
      cancelButtonText: "Tidak",
    }).then((result) => {
      if (result.isConfirmed) {
        setShowReply(false);
        setReplyText("");
      }
    });
  };

  return (
    <div className="pl-4 border-l border-[#6D4C41]/30">
      <div className="mb-2">
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-[#6b6867]">{comment.author}</span>
          <span className="text-lg text-gray-700">{new Date(comment.created_at).toLocaleString()}</span>
        </div>
        <p className="text-[#6D4C41] text-lg">{comment.content}</p>
        <button onClick={handleReplyClick} className="text-black text-lg mt-1 cursor-pointer">
          {showReply ? "Cancel" : "Reply"}
        </button>
      </div>

      {showReply && user && (
        <form onSubmit={handleReplySubmit} className="mb-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full border border-[#6D4C41]/30 bg-transparent p-2 rounded text-[#6D4C41]"
            placeholder="Write a reply..."
            rows={2}
          />
          <div className="mt-1 flex space-x-2">
            <button type="submit" className="bg-[#ce5c36] text-white px-3 py-1 rounded">
              {isPending ? "Posting..." : "Post Reply"}
            </button>
            <button type="button" onClick={handleCancelReply} className="bg-gray-400 text-white px-3 py-1 rounded">
              Cancel
            </button>
          </div>
          {isError && <p className="text-red-500">Error posting reply.</p>}
        </form>
      )}

      {comment.children && comment.children.length > 0 && (
        <div>
          <button onClick={() => setIsCollapsed((prev) => !prev)} title={isCollapsed ? "Hide Replies" : "Show Replies"}>
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
              </svg>
            )}
          </button>

          {!isCollapsed && (
            <div className="space-y-2">
              {comment.children.map((child, key) => (
                <CommentItem key={key} comment={child} postId={postId} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
