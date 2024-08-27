import { Document } from "mongoose";
import { Culture } from "./culture.interface";
import { Preference } from "./preference.interface";

export interface Overview extends Document{
    readonly user_id: string
    readonly culture: Culture
    readonly preference : Preference 
}