import { ChangeEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "../supabase-client";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

interface PostInput {
    title: string;
    content: string;
    avatar_url:string | null;
}

const createPost = async (post: PostInput, imageFile: File) => {
    const filePath = `${post.title}-${Date.now()}-${imageFile.name}`;
    
    const { error: uploadError } = await supabase.storage.from("post-images").upload(filePath, imageFile);
    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data: PublicURLData } = supabase.storage.from("post-images").getPublicUrl(filePath);
    const { data, error } = await supabase.from("posts").insert({ ...post, image_url: PublicURLData.publicUrl });
    
    if (error) {
        throw new Error(error.message);
    }
    return data;
}

export const CreatePost = () => {
    const [title, setTitle] = useState<string>("");
    const [content, setContent] = useState<string>("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const {user}=useAuth()

    const { mutate, isError, isPending, error } = useMutation({
        mutationFn: (data: { post: PostInput, imageFile: File }) => {
            return createPost(data.post, data.imageFile);
        },
        onSuccess: () => {
            // Reset form fields after successful submission
            setTitle('');
            setContent('');
            setSelectedFile(null);
    
            // SweetAlert sukses
            Swal.fire({
                title: "Berhasil Menambahkan Resep",
                text: "Resep Anda telah ditambahkan.",
                icon: "success",
                confirmButtonColor: "#6D4C41", // Warna coklat
            });
        }
    });

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault(); // Mencegah refresh halaman
        if (!selectedFile) return; // Pastikan ada file yang dipilih
        mutate({ post: { title, content, avatar_url:user?.user_metadata.avatar_url || null
        }, imageFile: selectedFile }); // Kirim data ke Supabase
    }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]); // Simpan file yang dipilih
        }
    }

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
            <div>
                <label htmlFor="title" className="block mb-2 font-semibold text-lg text-[#6D4C41]">Nama Resep</label>
                <input
                    className="w-full bg-[#E4E0E1] outline-none hover:ring-2 hover:ring-[#6D4C41] focus:ring-2 focus:ring-[#6D4C41] p-2 rounded text-[#6D4C41]"
                    type="text"
                    id="title"
                    required
                    value={title} // Mengikat nilai input ke state
                    onChange={(event) => setTitle(event.target.value)}
                />
            </div>
            <div>
                <label htmlFor="content" className="block mb-2 font-semibold text-lg text-[#6D4C41]">Resep</label>
                <textarea
                    id="content"
                    className="w-full bg-[#E4E0E1] outline-none hover:ring-2 hover:ring-[#6D4C41] focus:ring-2 focus:ring-[#6D4C41] p-2 rounded text-[#6D4C41]"
                    required
                    rows={5}
                    value={content} // Mengikat nilai textarea ke state
                    onChange={(event) => setContent(event.target.value)}
                />
                <label htmlFor="file" className="block mb-2 mt-2 font-semibold text-lg text-[#6D4C41]">Tambah Gambar</label>
                <input
                    type="file"
                    id="image"
                    accept="image/*"
                    className="w-full text-[#6D4C41] cursor-pointer"
                    required
                    onChange={handleFileChange}
                />
            </div>
            <button type="submit" 
            className="bg-[#6D4C41] text-white font-semibold text-lg transition-all px-4 py-2 rounded cursor-pointer hover:bg-[#AB886D]"
            
            >
            {isPending ? "Menambahkan..." : "Tambahkan Resep"}
            </button>
            {isError && <p className="text-red-500">Error Creating Post. {error.message}</p>}

        </form>
    );
}