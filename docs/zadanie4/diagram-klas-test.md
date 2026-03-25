classDiagram
    %% --- Warstwa Aplikacyjna i Serwisy ---
    class IAuthenticationService {
        <<interface>>
        +register(email: String, passwordRaw: String): AuthResult
        +login(email: String, passwordRaw: String): AuthToken
    }

    class IFriendshipService {
        <<interface>>
        +sendInvite(requesterId: UUID, addresseeId: UUID): Friendship
        +resolveInvite(friendshipId: UUID, status: FriendInviteStatus): Void
    }

    %% --- Model Domenowy ---
    class User {
        +id: UUID
        +email: String
        +username: String
        +registrationDate: DateTime
        +updateProfile(newUsername: String): Void
        +deactivateAccount(): Void
    }

    class Friendship {
        +id: UUID
        +requesterId: UUID
        +addresseeId: UUID
        +status: FriendInviteStatus
        +createdAt: DateTime
        +acceptedAt: DateTime
        +changeStatus(newStatus: FriendInviteStatus): Void
    }

    class TaskGroup {
        <<Aggregate Root>>
        +id: UUID
        +name: String
        +privacy: PrivacyLevel
        +inviteCode: String
        +createdAt: DateTime
        +changePrivacy(newLevel: PrivacyLevel): Void
        +addMember(user: User, role: GroupRole): GroupMember
        +removeMember(memberId: UUID): Void
        +generateNewInviteCode(): Void
    }

    class GroupMember {
        <<Value Object / Entity>>
        +id: UUID
        +userId: UUID
        +role: GroupRole
        +joinedAt: DateTime
        +assignRole(newRole: GroupRole): Void
    }

    class Task {
        +id: UUID
        +groupId: UUID
        +name: String
        +description: String
        +status: TaskStatus
        +trackProgress(entry: ProgressEntry, validator: IProgressValidator): Bool
        +markAsCompleted(): Void
        +archive(): Void
    }

    class ProgressEntry {
        +id: UUID
        +userId: UUID
        +value: Float
        +note: String
        +photoUrl: String
        +createdAt: DateTime
    }

    %% --- Wzorzec Strategii dla Walidacji (OCP i DIP) ---
    class IProgressValidator {
        <<interface>>
        +validate(task: Task, entry: ProgressEntry): Bool
    }

    class PhotoRequirementValidator {
        +validate(task: Task, entry: ProgressEntry): Bool
    }

    class GoalThresholdValidator {
        +validate(task: Task, entry: ProgressEntry): Bool
    }

    %% --- Relacje ---
    User <.. IAuthenticationService : "returns"
    IProgressValidator <|.. PhotoRequirementValidator : "implements"
    IProgressValidator <|.. GoalThresholdValidator : "implements"
    
    TaskGroup "1" *-- "1..*" GroupMember : "contains"
    TaskGroup "1" *-- "0..*" Task : "owns"
    Task "1" *-- "0..*" ProgressEntry : "tracks progress"