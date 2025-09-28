import { Model, DataTypes, Optional } from "sequelize";
import sequelize from "../../config/db";

interface UserAttributes {
  id: number;
  email: string;
  password: string | null;   // Google 
  isVerified: boolean;
  isGoogleLogin: boolean;    //  Google auth users
  verificationToken?: string | null;
  tokenExpiry?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpiry?: Date | null;
}

interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "isVerified" | "isGoogleLogin" | "password" | "verificationToken" | "tokenExpiry" | "resetPasswordToken" | "resetPasswordExpiry"> {}

class User extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: number;
  public email!: string;
  public password!: string | null;
  public isVerified!: boolean;
  public isGoogleLogin!: boolean;
  public verificationToken!: string | null;
  public tokenExpiry!: Date | null;
  public resetPasswordToken!: string | null;
  public resetPasswordExpiry!: Date | null;
}

User.init(
  {
    id: { 
      type: DataTypes.INTEGER, 
      autoIncrement: true, 
      primaryKey: true 
    },
    email: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    },
    password: { 
      type: DataTypes.STRING, 
      allowNull: true 
    }, 
    isVerified: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    isGoogleLogin: { 
      type: DataTypes.BOOLEAN, 
      defaultValue: false 
    },
    verificationToken: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    tokenExpiry: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
    resetPasswordToken: { 
      type: DataTypes.STRING, 
      allowNull: true 
    },
    resetPasswordExpiry: { 
      type: DataTypes.DATE, 
      allowNull: true 
    },
  },
  {
    sequelize,
    tableName: "users",
    indexes: [
      { fields: ["email"], unique: true },
      { fields: ["isVerified", "tokenExpiry"] },
      { fields: ["resetPasswordToken", "resetPasswordExpiry"] },
    ],
  }
);

export default User;
