import mongoose from "mongoose";


const profileSchema = new mongoose.Schema({
    Profilename:{
        type:String,
        required:true,
    },
    dob:{
        type:String,
        required:true
    },
    contact:{
        type:String,
        required:true,
    }
})

const ProfileModel = mongoose.model("profileModel",profileSchema)
export default ProfileModel;