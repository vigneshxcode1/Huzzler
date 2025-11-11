import mongoose from "mongoose";


const profileSchema = new mongoose.Schema({
    Profilename:{
        type:String,
        required:true,
    }
})

const ProfileModel = mongoose.model("profileModel",profileSchema)
export default ProfileModel;