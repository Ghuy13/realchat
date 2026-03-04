import Friend from "../models/Friend.js";
import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";


export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body

        const from = req.user._id // id của người đang đăng nhập

        // tránh gửi lời mời cho chính mình
        if (from === to) {
            return res.status(400).json({ message: 'Không thể gửi lời mời kết bạn cho chính mình' })
        }

        // kiểm tra ng nhận lời mời có trong db 
        const userExists = await User.exists({ _id: to })

        if (!userExists) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' })
        }

        // kiểm tra xem giữa 2 user có mối quan hện nào chưa 
        let userA = from.toString()
        let userB = to.toString()
        if (userA > userB) {
            [userA, userB] = [userB, userA]
        }

        const [alreadyFriends, existingFriend] = await Promise.all([
            Friend.findOne({ userA, userB }),
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            })
        ])

        if (alreadyFriends) {
            return res.status(400).json({ message: 'Hai người đã là bạn bè' })
        }
        if (existingFriend) {
            return res.status(400).json({ message: 'Đã có lời mời kết bạn đang chờ' })
        }

        const request = await FriendRequest.create({
            from, to, message
        })

        return res.status(201).json({ message: 'Yêu cầu kết bạn đã được gửi', request })




    } catch (error) {
        console.error('Lỗi khi gửi yêu cầu kết bạn', error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })

    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const userId = req.user._id

        const request = await FriendRequest.findById(requestId)

        if (!request) {
            return res.status(404).json({ message: 'Không tìm thấy mời mời kết bạn' })
        }

        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Không có quyền chấp nhận lời mời này' })

        }

        const friend = await Friend.create({
            userA: request.from,
            userB: request.to
        })
        await FriendRequest.findByIdAndDelete(requestId)

        const from = await User.findById(request.from).select('_id displayName avatarUrl').lean();
        return res.status(200).json({
            message: 'Chấp nhận lơi mời kết bạn thành công',
            newFiend: {
                _id: friend?._id,
                displayName: from?.displayName,
                avatarUrl: from?.avatarUrl
            }
        })

    } catch (error) {
        console.error('Lỗi khi chấp nhận lời mời kết bạn', error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })

    }
};

export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params
        const userId = req.user._id

        const request = await FriendRequest.findById(requestId)

        if (!request) {
            return res.status(404).json({ message: 'Không tìm thấy mời kết bạn' })
        }

        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Không có quyền từ chối lời mời này' })
        }

        await FriendRequest.findByIdAndDelete(requestId)

        return res.status(204).send();

    } catch (error) {
        console.error('Lỗi khi từ chối lời mời kết bạn', error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })

    }
};

export const getAllFriends = async (req, res) => {
    try {
        const userId = req.user._id

        const friendship = await Friend.find({
            $or: [{
                userA: userId
            }, {
                userB: userId

            }]
        })
            .populate("userA", "_id displayName avatarUrl")
            .populate("userB", "_id displayName avatarUrl")
            .lean()

        if (!friendship.length) {
            return res.status(200).json({ friends: [] })
        }
        const friends = friendship.map((f) => f.userA._id.toString() === userId.toString() ? f.userB : f.userA)

        return res.status(200).json({ friends })

    } catch (error) {
        console.error('Lỗi khi lấy danh sách bạn bè', error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })
    }
};

export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id

        const populateFields = ' _id username displayName avatarUrl'

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate('to', populateFields).lean(),
            FriendRequest.find({ to: userId }).populate('from', populateFields).lean()
        ])
        res.status(200).json({ sent, received })


    } catch (error) {
        console.error('Lỗi khi lấy danh sách yêu cầu kết bạn', error)
        return res.status(500).json({ message: 'Lỗi hệ thống' })

    }
};