Counters consistency

Hamesha transaction me update karo, jaise humne toggleLike, addComment, repostPost me kiya.

Agar direct DB update karoge without transaction, kabhi counts mismatch ho sakte hain.

Edge cases

Delete comment / unlike / delete repost → counters decrement karna mat bhoolna.

Optional validation

Kabhi-kabhi counters Post aur actual PostComment/PostLike rows mismatch ho sakte hain.

Periodically cron job ya migration script se counters sync kar sakte ho.


git add.
git commit -m "first commit"
git push