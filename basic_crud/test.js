function test(...params) {
  console.log(params);
  console.log(params.find(1));
  //   console.log(a);
  //   console.log(b);
  //   console.log(c);
}

// page function log :: [object Object],[object Object]
// object
// TypeError: movies.toJSON is not a function

// object
// undefined
// page function log :: [object Object],[object Object]

test(1, 2, 3);
