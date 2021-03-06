BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[Todo] (
    [id] INT NOT NULL IDENTITY(1,1),
    [todo] NVARCHAR(100) NOT NULL,
    [completed] BIT NOT NULL CONSTRAINT [Todo_completed_df] DEFAULT 0,
    [ownerId] VARCHAR(128) NOT NULL,
    CONSTRAINT [Todo_pkey] PRIMARY KEY ([id])
);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
