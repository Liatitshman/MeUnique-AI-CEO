#!/usr/bin/env python3

print("🎮 Discord Scraping Demo")
print("=" * 50)

# דוגמה לתוצאות
sample_results = [
    {
        "discord_id": "123456789",
        "username": "david_dev",
        "display_name": "David Cohen",
        "server": "React Israel",
        "messages_count": 156,
        "technical_messages": 89,
        "help_given": 34,
        "extracted_skills": ["react", "typescript", "node.js", "docker"],
        "relevance_score": 0.85,
        "potential_linkedin": "david-cohen-dev"
    },
    {
        "discord_id": "987654321",
        "username": "sarah_k",
        "display_name": "Sarah Katz",
        "server": "DevOps Israel",
        "messages_count": 234,
        "technical_messages": 156,
        "help_given": 67,
        "extracted_skills": ["kubernetes", "terraform", "aws", "python"],
        "relevance_score": 0.92,
        "potential_linkedin": None
    },
    {
        "discord_id": "456789123",
        "username": "moshe_backend",
        "display_name": "Moshe Levy",
        "server": "Node.js IL",
        "messages_count": 89,
        "technical_messages": 67,
        "help_given": 23,
        "extracted_skills": ["node.js", "express", "mongodb", "redis"],
        "relevance_score": 0.78,
        "potential_linkedin": "moshe-levy-dev"
    }
]

print("\n📊 Discord Servers to Scrape:")
servers = {
    "React Israel": {"members": 1200, "active": 400},
    "Node.js IL": {"members": 800, "active": 300},
    "DevOps Israel": {"members": 600, "active": 250},
    "Python IL": {"members": 900, "active": 350}
}

for server, stats in servers.items():
    print(f"   {server}: {stats['members']} members ({stats['active']} active)")

print("\n📊 Sample Results from Discord Scraping:")
for member in sample_results:
    print(f"\n👤 {member['display_name']} (@{member['username']})")
    print(f"   Server: {member['server']}")
    print(f"   Skills: {', '.join(member['extracted_skills'])}")
    print(f"   Relevance: {member['relevance_score']:.0%}")
    print(f"   Activity: {member['messages_count']} messages ({member['technical_messages']} technical)")
    print(f"   Community: Helped {member['help_given']} times")
    print(f"   LinkedIn: {'✅ Found' if member['potential_linkedin'] else '❌ Need to search'}")

print("\n💬 Personalized Discord DM Examples:")

print("\nFor David (Community Contributor):")
print("""
Hey David! 👋

I've noticed how helpful you've been in the React Israel community - your answers about react, typescript really show deep expertise.

I'm working with some exciting Israeli tech companies looking for talented developers like you. Would you be open to hearing about some opportunities that match your skills?

No pressure at all - just thought it might interest you!
""")

print("\nFor Sarah (Technical Expert):")
print("""
Hey Sarah! 

Your technical discussions in DevOps Israel caught my attention - especially around kubernetes, terraform.

I'm connected with several Israeli tech companies hiring developers with your skillset. Open to a quick chat about potential opportunities?

Let me know if you'd like to hear more!
""")

print("\n📈 Expected Discord Results:")
print("   Total servers: 4")
print("   Total members: 3,500")
print("   Active developers: 1,300")
print("   High relevance (>70%): ~400")
print("   With LinkedIn: ~200")
print("   Need LinkedIn search: ~200")

print("\n🚀 Discord Scraping Value:")
print("   400 high-quality candidates × $50 = $20,000 value")
print("   Cost: $0 (FREE!)")
print("   Time: 2-3 hours setup")
print("   ROI: ∞") 