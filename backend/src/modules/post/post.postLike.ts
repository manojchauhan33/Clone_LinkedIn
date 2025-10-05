import { Model, DataTypes } from "sequelize";
import sequelize from "../../config/db";
import User from "../auth/user.model";
import Post from "./post.model";

export class PostLike extends Model {
  public id!: number;
  public postId!: number;
  public userId!: number;
}

PostLike.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    postId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { 
        model: Post, 
        key: "id" 
      } 
    },
    userId: { 
      type: DataTypes.INTEGER, 
      allowNull: false, 
      references: { 
        model: User, 
        key: "id" 
      } 
    },
  },
  {
    sequelize,
    tableName: "post_likes",
    indexes: [{ unique: true, fields: ["postId", "userId"] }],
  }
);

PostLike.belongsTo(User, { foreignKey: "userId" });
PostLike.belongsTo(Post, { foreignKey: "postId" });

export default PostLike;
