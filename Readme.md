//linkedin colone in react typescript sql node express typescript 

first module now ended 
signup - name store in profile module because in future user can chane his name thats why 
login
login with google
verify gmail
forgotpassword
all authentication 

Generics <> use karke hum types ko variables ki tarah pass kar dete hain, jisse function, class, ya interface alag-alag data types ke saath kaam karne ke liye flexible ho jaata hai, aur saath hi type-safe bhi rehta hai.

id: 1
userId: 100 (you)
content: "I love football!"
isRepost: false
originalPostId: null
repostComment: null
repostCount: 0



id: 2
userId: 101 (the person reposting)
content: "I love football!"  ← copied from original
isRepost: true
originalPostId: 1  ← points to your original post
repostComment: "This is so true!"
repostCount: 0  ← for this repost itself
