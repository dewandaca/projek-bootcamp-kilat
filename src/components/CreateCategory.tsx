import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../supabase-client";

interface CategoryInput {
  name: string;
  description: string;
}
const createCategory = async (category: CategoryInput) => {
  const { error, data } = await supabase.from("categories").insert(category);

  if (error) throw new Error(error.message);
  return data;
};

export const CreateCategory = () => {
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { mutate, isPending, isError } = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      navigate("/categories");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate({ name, description });
  };
  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-b from-[#6D4C41] to-[#FF8A65] bg-clip-text text-transparent">
       Buat Kategori Baru
      </h2>
      <div>
        <label htmlFor="name" className="block mb-2 font-medium text-[#6D4C41]">
          Nama Kategori
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-[#6D4C41]/30 text-[#6D4C41] bg-transparent p-2 rounded"
          required
        />
      </div>
      <div>
        <label htmlFor="description" className="block mb-2 font-medium text-[#6D4C41]">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-[#6D4C41]/30 text-[#6D4C41] bg-transparent p-2 rounded"
          rows={3}
        />
      </div>
      <button
        type="submit"
        className="bg-[#9b4b2e] text-white px-4 py-2 rounded cursor-pointer"
      >
        {isPending ? "Creating..." : "Create Category"}
      </button>
      {isError && <p className="text-red-500">Error creating community.</p>}
    </form>
  );
};
