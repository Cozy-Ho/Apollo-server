const person = {
    name: "test1",
    age: 17,
    gender: "male"
}

const resolvers= {
    Query:{
        person: ()=> person
    }
}
export default resolvers;