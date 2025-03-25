import { CreatePost } from "../components/CreatePost"

export const CreatePostPage=()=>{
    return (
    <div className="pt-7">
      <h2 className="text-6xl font-bold mb-6 text-center bg-gradient-to-b from-[#6D4C41] to-[#AB886D] bg-clip-text text-transparent">
        Tambahkan Resep
      </h2>
        <CreatePost/>
    </div>
    )
}