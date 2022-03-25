function findUserByEmail (users, email) {
  for (let id in users) {
    if (users[id].email === email) {
      
      // console.log('email already taken');
      return users[id];
    }
  }
  return undefined;
};

module.exports = { findUserByEmail }

