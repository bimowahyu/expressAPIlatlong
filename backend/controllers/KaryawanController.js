// Import model Karyawan
import Karyawan from '../models/Karyawan.js';
import Department from '../models/Department.js';
import Cabang from '../models/Cabang.js';
import bcrypt from 'bcrypt';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';


// Handler untuk menampilkan daftar karyawan
export const GetKaryawan = async (req, res) => {
    try {
        let data = Karyawan.findAll();

        if (req.query.nama_lengkap) {
            data = data.where('nama_lengkap', { [Op.iLike]: `%${req.query.nama_lengkap}%` });
        }
        if (req.query.department_id) {
            // Pastikan department_id tidak undefined sebelum digunakan
            if (req.query.department_id !== undefined) {
                data = data.where('department_id', req.query.department_id);
            }
        }
        if (req.query.cabang_id) {
            data = data.where('cabang_id', req.query.cabang_id);
        }

        const karyawan = await data;
        const department = await Department.findAll();
        const cabang = await Cabang.findAll();
        
        res.status(200).json({ karyawan, department, cabang });
    } catch (error) {
        console.error(error);
        res.status(500).json({msg:"Internal Server Error"});
    }
};
export const getKaryawanByid = async (req, res) => {
    try {
        const { id } = req.params; // Ambil ID karyawan dari parameter permintaan
        const karyawan = await Karyawan.findByPk(id); // Cari karyawan berdasarkan ID

        if (karyawan) {
            // Jika karyawan ditemukan, kirim respons dengan data karyawan
            res.status(200).json(karyawan);
        } else {
            // Jika karyawan tidak ditemukan, kirim respons dengan pesan bahwa karyawan tidak ditemukan
            res.status(404).json({ msg: "Karyawan tidak ditemukan" });
        }
    } catch (error) {
        // Tangani kesalahan jika terjadi
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }

}

// Handler untuk menambahkan karyawan baru
export const createKaryawan = async (req, res) => {
    try {
        console.log(req.body); // Tambahkan ini untuk memeriksa payload permintaan
        const { nik, nama_lengkap, jabatan, DepartmentId, CabangId, no_telp, password } = req.body;

        let avatar = '';
        if (req.file) {
            const extension = req.file.originalname.split('.').pop();
            avatar = `${uuidv4()}.${extension}`;
            await writeFile(`public/uploads/karyawan/${avatar}`, req.file.buffer);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const createData = await Karyawan.create({
            nik,
            nama_lengkap,
            jabatan,
            DepartmentId,
            CabangId,
            no_telp,
            avatar,
            password: hashedPassword
        });

        if (createData) {
            res.status(200).json(createData);
        } else {
            res.status(500).json({ msg: "Data Karyawan gagal ditambah, cek kembali"});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({msg:"Internal Server Error"});
    }
};
// Handler untuk memperbarui data karyawan
export const updateKaryawan = async (req, res) => {
    try {
        const { id } = req.params;
        const { nik, nama_lengkap, jabatan, DepartmentId, CabangId, no_telp, password } = req.body;

        let avatar = '';
        if (req.file) {
            const extension = req.file.originalname.split('.').pop();
            avatar = `${uuidv4()}.${extension}`;
            await writeFile(`public/uploads/karyawan/${avatar}`, req.file.buffer);
        }

        const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

        const updateData = await Karyawan.update({
            nik,
            nama_lengkap,
            jabatan,
            DepartmentId,
            CabangId,
            no_telp,
            avatar: avatar || req.body.old_avatar,
            password: hashedPassword || req.body.old_password
        }, {
            where: { id }
        });

        if (updateData) {
            res.status(200).json({ msg: "Data Karyawan berhasil diupdate" });
        } else {
            res.status(500).json({ msg: "Data Karyawan gagal diupdate, cek kembali" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

// Handler untuk menghapus karyawan
export const destroyKaryawan = async (req, res) => {
    try {
        const { id } = req.params;
        const data = await Karyawan.findByPk(id);

        if (data.avatar) {
            await writeFile(`public/uploads/karyawan/${data.avatar}`);
        }

        const deleteData = await Karyawan.destroy({
            where: { id }
        });

        if (deleteData) {
            res.status(200).json({ msg: "Data Karyawan berhasil dihapus" });
        } else {
            res.status(500).json({ msg: "Data Karyawan gagal dihapus, cek kembali" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: "Internal Server Error" });
    }
};

