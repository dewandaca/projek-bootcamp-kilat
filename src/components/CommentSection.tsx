import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { CommentItem } from "./CommentItem";
import ConfirmationModal from "./ConfirmationModal"; // Import the modal component

interface Props {
    postId: number;
}

interface NewComment {
    content: string,
    parent_comment_id?: number | null;
}

export interface Comment {
    id: number;
    post_id: number;
    parent_comment_id: number | null;
    content: string;
    user_id: string;
    created_at: string;
    author: string;
}

const createComment = async (
    newComment: NewComment,
    postId: number,
    userId?: string,
    author?: string
) => {
    if (!userId || !author) {
        throw new Error("User tidak login");
    }
    const { error } = await supabase.from("comments").insert({
        post_id: postId,
        content: newComment.content,
        parent_comment_id: newComment.parent_comment_id || null,
        user_id: userId,
        author: author,
    });
    if (error) throw new Error(error.message);
};

const editComment = async (commentId: number, updatedContent: string, userId: string) => {
    const { error } = await supabase
        .from("comments")
        .update({ content: updatedContent })
        .eq("id", commentId)
        .eq("user_id", userId);
    if (error) throw new Error(error.message);
};

const deleteComment = async (commentId: number, userId: string) => {
    const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId)
        .eq("user_id", userId);
    if (error) throw new Error(error.message);
};

const fetchComments = async (postId: number): Promise<Comment[]> => {
    const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data as Comment[];
}

export const CommentSection = ({ postId }: Props) => {
    const [newCommentText, setNewCommentText] = useState<string>("");
    const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
    const [editingCommentText, setEditingCommentText] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const {
        data: comments,
        isLoading,
        error,
    } = useQuery<Comment[], Error>({
        queryKey: ["comments", postId],
        queryFn: () => fetchComments(postId),
        refetchInterval: 5000,
    });

    const { mutate: createMutate, isPending, isError } = useMutation({
        mutationFn: (newComment: NewComment) => createComment(
            newComment,
            postId,
            user?.id,
            user?.email
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        }
    });

    const { mutate: editMutate } = useMutation({
        mutationFn: (updatedContent: { commentId: number, content: string }) => editComment(
            updatedContent.commentId,
            updatedContent.content,
            user?.id!
        ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setEditingCommentId(null);
            setEditingCommentText("");
        }
    });

    const { mutate: deleteMutate } = useMutation({
        mutationFn: (commentId: number) => deleteComment(commentId, user?.id!),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["comments", postId] });
            setIsModalOpen(false); // Close the modal after deletion
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCommentText) return;
        createMutate({ content: newCommentText, parent_comment_id: null });
        setNewCommentText("");
    };

    const handleEditSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingCommentText || editingCommentId === null) return;
        editMutate({ commentId: editingCommentId, content: editingCommentText });
    };

    const openModal = (commentId: number) => {
        setCommentToDelete(commentId);
        setIsModalOpen(true);
    };

    const handleDelete = () => {
        if (commentToDelete) {
            deleteMutate(commentToDelete);
        }
    };

    const buildCommentTree = (
        flatComments: Comment[]
    ): (Comment & { children?: Comment[] })[] => {
        const map = new Map<number, Comment & { children?: Comment[] }>();
        const roots: (Comment & { children?: Comment[] })[] = [];

        flatComments.forEach((comment) => {
            map.set(comment.id, { ...comment, children: [] });
        });

        flatComments.forEach((comment) => {
            if (comment.parent_comment_id) {
                const parent = map.get(comment.parent_comment_id);
                if (parent) {
                    parent.children!.push(map.get(comment.id)!);
                }
            } else {
                roots.push(map.get(comment.id)!);
            }
        });

        return roots;
    };

    if (isLoading) {
        return <div>Loading comments...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const commentTree = comments ? buildCommentTree(comments) : [];

    return (
        <div>
            <h3 className="text-[#6D4C41] text-xl">Comments</h3>
            {/* Create comments */}
            {user ? (
                <form onSubmit={handleSubmit} className="mb-4">
                    <textarea
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full border border-[#6D4C41]/30 bg-transparent p-2 rounded text-[#6D4C41]"
                        placeholder="Write a comment..."
                        rows={3}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-[#ce5c36] text-white px-4 py-2 rounded cursor-pointer"
                    >
                        {isPending ? "Posting..." : "Post Comment"}
                    </button>
                    {isError && (
                        <p className="text-red-500 mt-2">Error posting comment.</p>
                    )}
                </form>
            ) : (
                <p className="mb-4 text-gray-600 text-xl">
                    You must be logged in to post a comment.
                </p>
            )}
            {/* Comment display */}
            <div className="space-y-4">
                {commentTree.map((comment) => (
                    <div key={comment.id}>
                        <CommentItem comment={comment} postId={postId} />
                        {user?.id === comment.user_id && (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditingCommentText(comment.content);
                                    }}
                                    className="text-blue-500"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => openModal(comment.id)}
                                    className="text-red-500"
                                >
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {editingCommentId !== null && (
                <form onSubmit={handleEditSubmit} className="mt-4">
                    <textarea
                        value={editingCommentText}
                        onChange={(e) => setEditingCommentText(e.target.value)}
                        className="w-full border border-[#6D4C41]/30 bg-transparent p-2 rounded text-[#6D4C41]"
                        placeholder="Edit your comment..."
                        rows={3}
                    />
                    <button
                        type="submit"
                        className="mt-2 bg-[#ce5c36] text-white px-4 py-2 rounded cursor-pointer"
                    >
                        Update Comment
                    </button>
                </form>
            )}
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};
