import { RoleModel } from "../models/index.js";
import { connectDB } from "../config/database.js";
const insertRole = async () => {
  try {
    await connectDB();
    const role = await RoleModel.create({
      TenPhanQuyen: "man",
    });
    console.log("Them thanh cong admin");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const updateRole = async () => {
  try {
    await connectDB();
    const [affectedRows] = await RoleModel.update(
      {
        TenPhanQuyen: "admin",
      },
      {
        where: { ID_PhanQuyen: 1 },
      }
    );
    if (affectedRows === 0) {
      console.log("Không tìm thấy role để update");
    } else {
      console.log("Sua thanh cong admin thanh admin_update");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

const deleteRole = async () => {
  try {
    await connectDB();
    const id = 4;
    const deletedRows = await RoleModel.destroy({
      where: { ID_PhanQuyen: id },
    });
    if (deletedRows === 0) {
      console.log("Ko co role nao bi xoa");
    } else {
      console.log(`Xóa role ${id} thành công`);
    }
  } catch (err) {
    console.error(err);
  }
};

deleteRole();
