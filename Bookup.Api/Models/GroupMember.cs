namespace Bookup.Api.Models
{
    public class GroupMember
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int GroupId { get; set; }
        public bool IsAdmin { get; set; }
        public int StatusId { get; set; }
        public string StatusDescription { get; set; } = string.Empty;
        public DateTime? JoinedAt { get; set; }
        public DateTime? LeaveAt { get; set; }
        
    }
}