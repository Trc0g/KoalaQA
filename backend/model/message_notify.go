package model

type MsgNotifyType uint

const (
	MsgNotifyTypeUnknown MsgNotifyType = iota
	MsgNotifyTypeReplyDiscuss
	MsgNotifyTypeReplyComment
	MsgNotifyTypeApplyComment
	MsgNotifyTypeLikeComment
	MsgNotifyTypeDislikeComment
	MsgNotifyTypeBotUnknown
)

type MessageNotify struct {
	Base

	UserID uint `gorm:"column:user_id"` // 通知到谁，除了发给机器人的信息，user_id 与 to_id 相同

	MessageNotifyInfo
	Read bool `gorm:"column:read;default:false"`
}

func init() {
	registerAutoMigrate(&MessageNotify{})
}

type MessageNotifyInfo struct {
	DiscussID    uint          `gorm:"column:discussion_id" json:"discuss_id"`
	DiscussTitle string        `gorm:"disucss_title" json:"discuss_title"`
	Type         MsgNotifyType `gorm:"column:type" json:"type"`
	FromID       uint          `gorm:"column:from_id" json:"from_id"`
	FromName     string        `gorm:"column:from_name;type:text" json:"from_name"`
	FromBot      bool          `gorm:"column:from_bot" json:"from_bot"`
	ToID         uint          `gorm:"column:to_id" json:"to_id"`
	ToName       string        `gorm:"column:to_name;type:text" json:"to_name"`
	ToBot        bool          `gorm:"to_bot" json:"to_bot"`
}
