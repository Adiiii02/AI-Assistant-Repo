//mutation - insert,del,etc
//query-fetch

import { v } from "convex/values";
import { mutation , query } from "./_generated/server";

export const createUser = mutation({
    args:{
        email:v.string(),
        userName:v.string(),
        imageurl:v.string()
    },
    handler:async(ctx,args)=>{
        //if user already exits
        const user = await ctx.db.query('users')
        .filter((q)=>q.eq(q.field('email'),args.email))
        .collect();

        //if not , insert user entry
        if(user.length==0){
            await ctx.db.insert('users',{
                email:args.email,
                userName:args.userName,
                imageurl:args.imageurl,
                upgraded:false
            })
            // return "New Created"
            return 1;
        }

        return 0;

        // return "Already Present"
    }
})

export const upgradePlan = mutation({
    args:{
        email:v.string()
    },
    handler:async (ctx,args)=>{
        const res = await ctx.db.query('users')
        .filter((q)=>q.eq(q.field('email'),args.email))
        .collect()

        if(res){
            await ctx.db.patch(res[0]._id,{upgraded:true})
        }
    }
})

export const GetUserInfo= query({
    args:{
        email:v.optional(v.string())
    },
    handler:async(ctx,args)=>{
        if(!args.email) return 
        const res = await ctx.db.query('users')
        .filter((q)=>q.eq(q.field('email'),args?.email))
        .collect()
        
        return res[0]
    }
})