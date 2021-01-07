const resolvers={
    Query:{
        master:()=>'test',
        blogs:(_,{input_name,input_rank})=>{
            return[
                {
                    blog_name:"jason9319",
                    rank:1
                },
                {
                    blog_name:"ryulstory",
                    rank:99
                },
                {
                    blog_name:"sejinik",
                    rank:42
                }
            ].filter((blog)=>{
                if(!input_name&&!input_rank){
                    return true;
                }
                if(input_name&&!input_rank&&input_name==blog.blog_name){
                    return true;
                }
                if(!input_name&&input_rank&&input_rank==blog.rank){
                    return true;
                }
                if(input_name&&input_rank&&input_name==blog.blog_name&&input_rank==blog.rank){
                    return true;
                }
                return false;
            })
        }
    }
};
module.exports=resolvers;