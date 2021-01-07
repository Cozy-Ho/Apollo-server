// src/graphql/resolvers.js
const movies = require('../database/movies');

const resolvers = {
  Query: {
    movies: () => movies,
    movie: (_, { id }) => {
      return movies.filter(movie => movie.id === id)[0];
    }
  },
  Mutation: {
    addMovie: (_, { name, rating }) => {
      // 영화 제목 중복 검사
      if (movies.find(movie => movie.name === name)) {
        console.log("앗! 중복 입력입니다리");
        return null;
      }
      
      // 데이터베이스에 추가
      const newMovie = {
        id: movies.length + 1,
        name,
        rating
      };
      movies.push(newMovie);
      console.log("데이터 추가 완료!")
      return newMovie;
    }
  }
};

module.exports=resolvers;