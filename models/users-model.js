const db = require("../database/dbConfig");
const BucketList = require("./bucketList-model");

module.exports = {
  add,
  find,
  findBy,
  findById,
  update,
  remove,
  findUserWithData
};

function add(user) {
  return db("users")
    .insert(user)
    .then(ids => {
      const [id] = ids;
      return findById(id);
    });
}

function find() {
  return db("users");
}

function findById(id) {
  return db("users")
    .select("user_id", "username", "email")
    .where("user_id", id)
    .first();
}

function findUserBucketListByIdAndType(id, bool) {
  return db("users")
    .where("user_id", id)
    .andWhere("private", bool)
    .select(
      "bucket_list_id",
      "bucket_list_name",
      "bucket_list_user_id",
      "private"
    )
    .join("bucketLists", "users.user_id", "bucketLists.bucket_list_user_id");
}

function findBy(filter) {
  return db("users").where(filter);
}

function remove(id) {
  return db("users")
    .where({ id })
    .del();
}

function update(data, id) {
  return db("users")
    .where({ id })
    .update(data);
}

function findUserWithData(id) {
  const userQuery = findById(id);
  const userPrivateBucketListQuery = findUserBucketListByIdAndType(id, true);
  const userSharedBucketListQuery = findUserBucketListByIdAndType(id, false);
  return Promise.all([
    userQuery,
    userSharedBucketListQuery,
    userPrivateBucketListQuery
  ]).then(([user, sharedBuckets, privateBuckets]) => {
    user.sharedBucketLists = sharedBuckets;
    user.privateBucketLists = privateBuckets;
    return user;
  });
}

// return db("users")
// .where("user_id", id)
// .first()
// .then(user => {
//   let myUser = { ...user };
//   return (
//     db("users")
//       //.select("user_id", "username", "email")
//       .where("user_id", id)
//       .join(
//         "bucketLists",
//         "users.user_id",
//         "bucketLists.bucket_list_user_id"
//       )
//       .then(allBucketListsByUser => {})
//   );
// });

/*     .then(user => {
      let myUser = { ...user };
      return db("bucketLists as BL")
        .join(
          "bucketListsItems as BLI",
          "BL.bucket_list_id",
          "BLI.bucket_list_id"
        )
        .where("bucket_list_user_id", id)
        .then(bucketlist => {
          let sharedList = bucketlist.filter(e => e.private === 0);
          let privateList = bucketlist.filter(e => e.private === 1);
          myUser.sharedList = sharedList;
          myUser.privateList = privateList;
          return myUser;
        });
    });*/
