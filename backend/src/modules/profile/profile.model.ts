import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/db";
import User from "../auth/user.model";

interface Attributes {
  id: number;
  userId: number;
  name: string;
}

interface ProfileCreationAttributes extends Optional<Attributes, "id"> {}

class Profile extends Model<Attributes, ProfileCreationAttributes> implements Attributes {
  public id!: number;
  public userId!: number;
  public name!: string;
}

Profile.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    tableName: "profiles",
  }
);


User.hasOne(Profile, { as: "profile", foreignKey: "userId", onDelete: "CASCADE" });
Profile.belongsTo(User, { as: "user", foreignKey: "userId" });

export default Profile;
